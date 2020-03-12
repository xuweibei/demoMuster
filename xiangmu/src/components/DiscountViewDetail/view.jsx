import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber, Radio } from 'antd';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';


import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoney } from '@/utils';
import ContentBox from '@/components/ContentBox';

const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class DiscountView extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            editMode: props.editMode,//编辑模式
            data: [],
            total: 0 
        };
    }

    componentWillMount() {

        let data = this.props.orderProductDiscountList.filter(a => a.productId == this.state.dataModel.productId);
        this.setState({
            data: data || [],
        })
    
    }
    onCancel = () => {
        this.props.viewCallback();
    }

    //标题
    getTitle() {
        return '折扣优惠详细信息'
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }

    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.state.editMode) {
            case "View":
                {
                    let columns = [];
                    //table 输出列定义
                    columns = [
                        {
                            title: '优惠名称',
                            dataIndex: 'productDiscountName',
                        },{
                            title: '优惠类型',
                            dataIndex: 'productDiscountTypeStr',
                        },{
                            title: '优惠金额',
                            dataIndex: 'discountAmount',
                            render: (value, record, index) => {
                                return <span>{formatMoney(value || 0)}</span>
                            }
                        }];
                    

                    block_content = (
                        <div style={{ width: '90%' }}>
                            {/* 数据表格 */}
                            <div className="search-result-list">
                                <Table columns={columns} //列定义
                                    pagination={false}
                                    dataSource={this.state.data}//数据
                                    bordered
                                />
                            </div>
                            
                            
                        </div>
                    )
                }
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        if (this.state.editMode == 'View') {

            return (
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_editModeView}
                    <div className="dv_split"></div>
                </ContentBox>
                // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
                //     {block_editModeView}
                // </Card>

            );
        }
        else {
            return block_editModeView;
        }
    }
}

const WrappedDiscountView = Form.create()(DiscountView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedDiscountView);
