//标准组件环境  电子签
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


const dateFormat = 'YYYY-MM-DD';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml, formatMoney } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';

import { getOrderById, auditOrder } from '@/actions/recruit';

class Signature extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            currentDataModel: props.orderData || {},
            loading: false,
        }
    }
    componentWillMount() {
    }
    componentWillUnMount() {
    }

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        var d = this.state.currentDataModel;
      let block_content =
        <ContentBox titleName='合同' >
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="姓名"
                >
                  {d.realName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单号"
                >
                  {d.orderSn}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单类型"
                >
                  {d.orderType == 1 ? '个人订单' : d.partnerClassType == 1 ? '大客户方向班' : '大客户精英班'}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="订单金额（¥）"
                >
                  {formatMoney(d.totalAmount)}
                </FormItem>
              </Col>

              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="订单状态"
                >
                  {d.orderStatusStr}
                </FormItem>
              </Col>
              <Col span={24}>
                  {d.esignType==2 && <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="纸质合同"
                >
                  {<a href={d.esignFile} target='_Blank'>下载纸质合同</a>}
                </FormItem>}
                {
                  d.esignType==1 && <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="电子合同"
                  >
                  {<a href={d.esignFile} target='_Blank'>下载电子合同</a>}
                  </FormItem>
                }
                {d.esignType!=1 && d.esignType!=2 && <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="合同"
                  >
                  {'无合同信息'}
                  </FormItem>
                }
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  style={{ paddingRight: 18 }}
                  label="上传人及日期"
                >
                  {d.esignCreateName}  {timestampToTime(d.esignCreateDate, false)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </ContentBox>


      return block_content;
    }
}
//表单组件 封装
const WrappedAuditContent = Form.create()(Signature);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //let branchId = state.auth.currentUser.userType.orgId;
    let orgType = state.auth.currentUser.userType.usertype;  //1 总部；2 大区；3 分部
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        getOrderById: bindActionCreators(getOrderById, dispatch),
        auditOrder: bindActionCreators(auditOrder, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuditContent);
