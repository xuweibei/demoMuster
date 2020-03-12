 
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { Modal, message, Form, Row, Col, Table, Input, Button, Icon, DatePicker, InputNumber, Select, Checkbox, Spin, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';
import AreasSelect from '@/components/AreasSelect';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, convertTextToHtml, split } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

import { 
    partnerProductPriceApplySearchZPriceForPartner
} from '@/actions/partner';
 
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
 
class ProductPriceApplyView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: {
                currentPage: 1,
                pageSize: 999,
                productName: '',
                recruitBatchId: '',
                itemId: '',
                classTypeId: '',
                productType: '',
            },
            data: [],//商品列表
            product_price_list: [],//商品价格明细列表
            all_CourseCategorys: [],//所有科目
            PartnerContractList: [],//合同列表
            dic_fenqi: [1, 2, 3, 4].map((item, index) => {
                return { id: item, money: 0, courseCategoryIds: [] }
            }),
            currentFenQi: 4,//分期数
            _currentFenQi: 4,//分期数
            tableLoading: false,
            dic_partnerClassTypes: [],//字典
        }; 
    }

    componentWillMount() {
        //加载字典数据
        this.loadBizDictionary(['parter_university_level', 'university_category', 'consume_ability', 'study_ability']);  
    }

    //检索数据
    fetchZbProductList(condition) { 
        this.props.partnerProductPriceApplySearchZPriceForPartner(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    ...data,
                })
            }
            else {
                message.error(data.message);
            }
        })
    }
   
    //标题
    getTitle() { 
        return `查看`;
    } 

    //多种模式视图处理
    renderEditModeOfView() { 
        console.log(this.props)
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form; 
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="高校名称">
                                    <span>{this.state.dataModel.intentionUniversityName}</span>
                                </FormItem>
                            </Col> 
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="合作意向学院">
                                    <span>{this.state.dataModel.intentionDepartment}</span>
                                </FormItem>
                            </Col>  
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="所在城市">
                                    <span>{this.state.dataModel.provinceName+this.state.dataModel.cityName}</span> 
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="所属分公司">
                                    <span>{this.state.dataModel.branchName}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="开发/维护负责人">
                                    <span>{this.state.dataModel.developUserName}</span>
                                </FormItem>
                            </Col>  
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={'高校层次'} >
                                    <span>{this.state.dataModel.universityLevelName}</span> 
                                </FormItem>
                            </Col>
                            <Col span={12}>
                            <FormItem {...searchFormItemLayout} label={'高校类别'} > 
                                    <span>{this.state.dataModel.universityCategoryName}</span>
                            </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="对口专业规模">
                                    <span>{this.state.dataModel.counterpartMajorNum}</span>
                                </FormItem>
                            </Col> 
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="年度营业额">
                                    <span>{this.state.dataModel.yearAmount}</span>
                                </FormItem>
                            </Col> 
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="消费能力判断">
                                    <span>{this.state.dataModel.consumeAbilityName}</span>
                                </FormItem>
                            </Col> 
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学习能力判断">
                                    <span>{this.state.dataModel.studyAbilityName}</span>
                                </FormItem>
                            </Col> 
                            <Col span={24}> <span style={{color:'red',marginLeft:'7%'}}>低 - 生活费1000元/月以下; 中 - 生活费1000元/月-2000元/月; 高 - 2000元/月以上</span></Col> 
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="备注">
                                    <span>{this.state.dataModel.remark}</span>
                                </FormItem>
                            </Col>  
                        </Row>
                    </Form>
                ); 
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedView = Form.create()(ProductPriceApplyView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        partnerProductPriceApplySearchZPriceForPartner: bindActionCreators(partnerProductPriceApplySearchZPriceForPartner, dispatch), 
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
